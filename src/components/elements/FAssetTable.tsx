import React, {
    useCallback,
    useState,
    memo,
    useMemo,
    ReactNode,
    CSSProperties
} from "react";
import {
    Table,
    Text,
    rem,
    Pagination,
    Popover,
    Button,
    Styles,
    ClassNames
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconArrowsMoveVertical,
    IconArrowUp,
    IconDotsVertical,
    IconSortDescending,
    IconSortAscending
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { orderBy } from "lodash-es";
import { isBoolean, isNumeric, toNumber } from "@/utils";
import classes from "@/styles/components/elements/FAssetTable.module.scss";

export interface IFAssetColumn {
    id: string;
    label: string | ReactNode;
    sorted?: boolean;
    render?: (item: any) => React.ReactNode;
    sortColumns?: { field: string, direction: 'asc' | 'desc', label: string }[];
    thClass?: string;
    thInnerClass?: string;
    tdClass?: string;
    tdInnerClass?: string;
    onTdClick?: (item: any) => void;
}
interface IFAssetTable {
    items: any[];
    columns: IFAssetColumn[];
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
    styles?: Styles<{
        props: any;
        stylesNames: string;
    }>;
    classNames?: ClassNames<{
        props: any;
        stylesNames: string;
    }>;
    emptyLabel?: string;
    pagination?: boolean;
    perPage?: number;
    scrollContainerWidth?: number;
    mobileBreakPoint?: number;
    appendColumn?: (item: any) => React.ReactNode;
    verticalSpacing?: string;
}

interface ISortStatus {
    column: string | undefined;
    direction: string | undefined;
    field: string | undefined;
}

const PER_PAGE = 10;

const FAssetTable = memo((
    {
        items,
        columns,
        loading,
        className,
        classNames,
        style,
        styles,
        emptyLabel,
        pagination,
        scrollContainerWidth,
        perPage,
        mobileBreakPoint,
        appendColumn,
        verticalSpacing
    }: IFAssetTable
) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isPopoverActive, setIsPopoverActive] = useState<any>({});
    const [sortStatus, setSortStatus] = useState<ISortStatus>({
        column: undefined,
        direction: undefined,
        field: undefined
    });
    const { t } = useTranslation();
    const mediaQuery = useMediaQuery(`(max-width: ${mobileBreakPoint}px)`);
    const matchesMobileBreakPoint = mobileBreakPoint !== undefined
        ? mediaQuery
        : false;

    const sortFunc = (item: any, fieldId: string) => {
        let field = item[fieldId];
        if (field === null || undefined) {
            return null;
        }
        if (typeof item[fieldId] === 'number') {
            field = item[fieldId];
        } else if (isNumeric(item[fieldId])) {
            field = toNumber(item[fieldId]);
        } else if (isBoolean(item[fieldId])) {
            field = item[fieldId];
        } else {
            field = (item[fieldId] as any).toLowerCase();
        }

        return field;
    }

    const onSort = (column: IFAssetColumn) => {
        if (!column.sorted) return;

        let direction: 'asc' | 'desc' = 'asc';
        let field: string = column.id;

        if (sortStatus?.column === column.id) {
            direction = sortStatus.direction === 'asc' ? 'desc' : 'asc';
        }

        if (column.sortColumns) {
            const currentIndex = column.sortColumns.findIndex(m => m.direction === sortStatus.direction && sortStatus.field === m.field);
            const nextIndex = (currentIndex + 1) % column.sortColumns.length;
            const nextSortColumns = column.sortColumns[nextIndex];
            direction = nextSortColumns.direction;
            field = nextSortColumns.field
        }

        setSortStatus({
            column: column.id,
            direction: direction,
            field: field
        });
    }

    const onMultiSort = (column: string, field: string, direction: string) => {
        setSortStatus({
            column: column,
            direction: direction,
            field:field
        });
        setIsPopoverActive((prev: any) => ({
            ...prev,
            [column]: false,
        }));
    }

    const chunk = useCallback(<T extends any>(array: T[], size: number): T[][] => {
        if (!array.length) {
            return [];
        }
        const head = array.slice(0, size);
        const tail = array.slice(size);
        return [head, ...chunk(tail, size)];
    }, []);

    const localItems = useMemo(() => {
        let localItems = [...items];

        if (sortStatus.column) {
            const column = columns.find(column => column.id === sortStatus.column);
            if (column) {
                localItems = orderBy(
                    items,
                    [(item: any) => sortFunc(item, sortStatus.field || column.id)],
                    [sortStatus.direction === 'asc' ? 'asc' : 'desc']
                );
            }
        }

        if (pagination) {
            const paginatedRows = chunk(localItems, perPage ?? PER_PAGE);
            if (paginatedRows.length > 0) {
                setTotalPages(paginatedRows.length);
                localItems = paginatedRows[currentPage - 1];
            }
        }

        return localItems;
    }, [items, sortStatus, pagination, currentPage]);

    const renderRows = useCallback(() => {
        return localItems?.map((item, index) => (
            <Table.Tr key={index}>
                {columns.map(column => (
                    <Table.Td
                        key={column.id}
                        className={`${column.tdClass ?? ''}`}
                        onClick={column.onTdClick ? () => column.onTdClick?.(item) : undefined}
                    >
                        <div className={`${column.tdInnerClass ? column.tdInnerClass : ''}`}>
                            {column.render !== undefined
                                ? column.render(item)
                                : item[column.id]
                            }
                        </div>
                    </Table.Td>
                ))}
            </Table.Tr>
        ));
    }, [localItems]);

    return (
        <div className={className} style={style}>
            {matchesMobileBreakPoint &&
                <>
                    {localItems?.map((item, index) => (
                        <Table
                            verticalSpacing="lg"
                            className={index < localItems.length - 1 ? 'mb-8' : ''}
                            key={index}
                        >
                            <Table.Tbody>
                                {columns.map(column => (
                                    <Table.Tr key={column.id}>
                                        <Table.Td
                                            className={`font-normal text-sm uppercase ${column.thClass ?? ''}`}
                                            style={{
                                                color: 'rgba(119, 119, 119, 1)',
                                                backgroundColor: 'rgba(251, 251, 251, 1)',
                                                borderBottom: '1px solid rgba(231, 231, 231, 1)'
                                            }}
                                        >
                                            {column.label}
                                        </Table.Td>
                                        <Table.Td
                                            className={column.tdClass ?? ''}
                                        >
                                            {column.render !== undefined
                                                ? column.render(item)
                                                : item[column.id]
                                            }
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                {appendColumn && appendColumn(item)}
                            </Table.Tbody>
                        </Table>
                        ))
                    }
                    {localItems.length === 0 && !loading &&
                        <Table
                            verticalSpacing={verticalSpacing ?? 'lg'}
                            className="mb-8"
                        >
                            <Table.Tbody>
                                <Table.Tr>
                                    <Table.Td colSpan={13} className="text-center">
                                        <Text>{emptyLabel ?? t('fasset_table.empty_label')}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                    }
                </>
            }
            {!matchesMobileBreakPoint &&
                <Component scrollContainerWidth={scrollContainerWidth}>
                    <Table
                        verticalSpacing={verticalSpacing ?? 'lg'}
                        styles={styles}
                        classNames={classNames}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                {columns.map(column => (
                                    <Table.Th
                                        key={column.id}
                                        className={`uppercase ${column.sorted ? 'cursor-pointer' : ''} ${column.thClass ?? ''}`}
                                    >
                                        <div className={(column.thInnerClass ? column.thInnerClass : '') + ' ' + 'flex items-center'}>
                                            {!React.isValidElement(column.label) &&
                                                <Text
                                                    onClick={() => onSort(column)}
                                                    size="sm"
                                                >
                                                    {column.label}
                                                </Text>
                                            }
                                            {React.isValidElement(column.label) &&
                                                <div onClick={() => onSort(column)}>{column.label}</div>
                                            }
                                            {sortStatus.column === column.id &&
                                                <IconArrowUp
                                                    style={{ width: rem(15), height: rem(15) }}
                                                    className={`${classes.sortIcon} ${sortStatus.direction === 'desc' ? classes.isReversed : ''} ml-1 flex-shrink-0`}
                                                />
                                            }
                                            {sortStatus.column !== column.id && column.sorted &&
                                                <IconArrowsMoveVertical
                                                    style={{ width: rem(15), height: rem(15) }}
                                                    className="ml-1 flex-shrink-0"
                                                />
                                            }
                                            {column.sortColumns !== undefined &&
                                                <Popover
                                                    withArrow
                                                    opened={isPopoverActive[column.id] || false}
                                                    onChange={() => setIsPopoverActive((prev: any) => ({
                                                        ...prev,
                                                        [column.id]: !prev[column.id],
                                                    }))}
                                                >
                                                    <Popover.Target>
                                                        <IconDotsVertical
                                                            style={{ width: rem(15), height: rem(15) }}
                                                            className="ml-1 flex-shrink-0"
                                                            onClick={() => setIsPopoverActive((prev: any) => ({
                                                                ...prev,
                                                                [column.id]: true,
                                                            }))}
                                                        />
                                                    </Popover.Target>
                                                    <Popover.Dropdown>
                                                        {column.sortColumns.map((sortColumn, index) => (
                                                            <Button
                                                                variant="subtle"
                                                                key={index}
                                                                leftSection={sortColumn.direction === 'asc'
                                                                    ? <IconSortAscending
                                                                        style={{ width: rem(15), height: rem(15) }}
                                                                        className="flex-shrink-0"
                                                                    />
                                                                    : <IconSortDescending
                                                                        style={{ width: rem(15), height: rem(15) }}
                                                                        className="flex-shrink-0"
                                                                    />
                                                                }
                                                                onClick={() => onMultiSort(column.id, sortColumn.field!, sortColumn.direction!)}
                                                                disabled={column.id === sortStatus?.column && sortStatus?.field === sortColumn.field && sortStatus?.direction === sortColumn.direction}
                                                                className="block text-black font-normal hover:!bg-gray-100 disabled:!bg-transparent disabled:!text-gray-300 disabled:hover:!text-gray-300"
                                                            >
                                                                {t(`fasset_table.sort_by_${sortColumn.direction}_label`, { label: sortColumn.label })}
                                                            </Button>
                                                        ))}
                                                    </Popover.Dropdown>
                                                </Popover>
                                            }
                                        </div>
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {localItems.length === 0 && !loading &&
                                <Table.Tr>
                                    <Table.Td colSpan={13} className="text-center">
                                        <Text>{emptyLabel ?? t('fasset_table.empty_label')}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            }
                            {renderRows()}
                        </Table.Tbody>
                    </Table>
                </Component>
            }
            {pagination && localItems.length > 0 &&
                <div className="flex justify-end">
                    <Pagination
                        total={totalPages}
                        value={currentPage}
                        onChange={setCurrentPage}
                        size="xs"
                        className="mt-4"
                    />
                </div>
            }
        </div>
    );
});

FAssetTable.displayName = 'FAssetTable';

export default FAssetTable;

function Component({ children, scrollContainerWidth }: { children: React.ReactNode, scrollContainerWidth: number|undefined }) {
    return scrollContainerWidth !== undefined
        ? <Table.ScrollContainer minWidth={scrollContainerWidth}>{children}</Table.ScrollContainer>
        : <div>{children}</div>
}
